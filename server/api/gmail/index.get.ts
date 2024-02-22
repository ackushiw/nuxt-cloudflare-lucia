import { eq, sql, and } from "drizzle-orm";
import { oauth_account } from "@/server/db/schema";


async function getMessageDetails(messageId: string, accessToken: string) {
  // Make the API request to get the details of a specific message
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch message details: ${data.error.message}`);
  }

  // Extract email details from the response
  const message = data.payload;

  // Extract subject
  const subject = message.headers.find((header: any) => header.name === 'Subject').value;

  // Extract recipients
  const from = message.headers.filter((header: any) => header.name === 'From').map((header: any) => header.value);
  const to = message.headers.filter((header: any) => header.name === 'To').map((header: any) => header.value);
  const cc = message.headers.filter((header: any) => header.name === 'Cc').map((header: any) => header.value);
  const bcc = message.headers.filter((header: any) => header.name === 'Bcc').map((header: any) => header.value);
  const recipients = [...to, ...cc, ...bcc];

  // Extract body
  let body = '';
  if (message.parts) {
    const bodyPart = message.parts.find((part: any) => part.mimeType === 'text/plain');
    if (bodyPart) {
      body = Buffer.from(bodyPart.body.data, 'base64').toString();
    }
  }

  return {
    from,
    subject,
    recipients,
    body
  };
}

async function listMessagesByToEmail(toEmail: string, fromEmail: string, accessToken: string) {
  // Construct the query parameter for filtering by "to" email address
  const query = `to:${toEmail}`;

  try {
    
  
  // Make the API request to list messages
  const data = await $fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });


  // Extract email data from the response
  const messages = data.messages || [];

  if (messages.length === 0) {
    return null
  }

  return getMessageDetails(messages[0].id, accessToken)

 
} catch (error) {
  throw new Error(`Failed to fetch messages: ${error.message}`);
    
}
}


export default defineEventHandler(async (event) => {
  const db = event.context.db
  const user = event.context.user
  const toEmail = getQuery(event).toEmail ||  'mresente@gmail.com'
  if (!user) {
    throw createError({
      statusCode: 403,
      statusMessage: "Unauthorized",
    })
  }

  const existingUser = await db
      .select()
      .from(oauth_account)
      .where(
        and(
          eq(oauth_account.providerId, "google"), // Change providerId for Google
          eq(oauth_account.userId, sql.placeholder("id"))
        )
      )
      .prepare()
      .get({ id: user.id })



  return {
    existingUser,
    messages: await listMessagesByToEmail(toEmail, user.email, existingUser.googleAccessToken)
  }
})
