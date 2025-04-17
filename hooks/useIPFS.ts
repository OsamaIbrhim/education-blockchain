import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_API_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client: IPFSHTTPClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export const useIPFS = () => {
  const uploadToIPFS = async (file: File): Promise<string> => {
    try {
      const added = await client.add(
        file,
        {
          progress: (prog: number) => console.log(`received: ${prog}`),
        }
      );
      const url = `https://ipfs.io/ipfs/${added.path}`;
      return url;
    } catch (error: any) {
      throw new Error(error.message || 'Error uploading to IPFS');
    }
  };

  return { uploadToIPFS };
}; 