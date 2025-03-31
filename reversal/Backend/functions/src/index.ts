import { google } from 'googleapis';
import { onRequest } from "firebase-functions/v2/https";

const TARGET_DRIVE_FOLDER_ID = '1MlFwrIIBZH5ffsTAR0lRISzKZ7LBhNbt'

const drive = google.drive({ version: 'v3' });
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});


export const search = onRequest({ cors: true }, async (request, response) => {

  if (request.method !== 'POST') {
    console.warn(`Received non-POST request: ${request.method}`);
    response.status(405).send({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { csvContent, prolificID } = request.body;

    if (!csvContent || typeof csvContent !== 'string') {
      console.warn('Validation Error: Missing or invalid csvContent', request.body); // Log body for debugging
      response.status(400).send({ error: 'Bad Request: Missing or invalid csvContent field (must be a string).' });
      return;
    }
    if (!prolificID || typeof prolificID !== 'string' || prolificID.trim() === '') {
      console.warn('Validation Error: Missing or invalid prolificID', request.body); // Log body for debugging
      response.status(400).send({ error: 'Bad Request: Missing or invalid prolificID field (must be a non-empty string).' });
      return;
    }

    const authClient: any = await auth.getClient();
    google.options({ auth: authClient });

    const safeProlificID = prolificID.replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${safeProlificID}_${timestamp}.csv`;

    const fileMetadata = {
      name: fileName,
      mimeType: 'text/csv',
      ...(TARGET_DRIVE_FOLDER_ID && { parents: [TARGET_DRIVE_FOLDER_ID] }),
    };

    const media = {
      mimeType: 'text/csv',
      body: csvContent,
    };

    if (TARGET_DRIVE_FOLDER_ID) {
      console.log(`Attempting upload: File='${fileName}', FolderID='${TARGET_DRIVE_FOLDER_ID}'`);
    } else {
      console.log(`Attempting upload: File='${fileName}' to root Drive`);
    }

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log(`Successfully uploaded File ID: ${file.data.id}, Name: ${file.data.name}`);

    response.status(200).json({
      message: 'File uploaded successfully to Google Drive.',
      fileId: file.data.id,
      fileName: file.data.name,
      fileLink: file.data.webViewLink,
    });

  } catch (error: any) {
    console.error('Error uploading file to Google Drive:', error);

    const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
    const googleApiErrorCode = error.code;

    response.status(500).send({
      error: `Failed to upload file to Google Drive. Reason: ${errorMessage}`,
      ...(googleApiErrorCode && { googleApiErrorCode: googleApiErrorCode }),
    });
  }
});