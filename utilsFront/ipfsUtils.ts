import { create } from 'ipfs-http-client';

const auth = 'Basic ' + Buffer.from(
  '8f624b421db6e7033530:b3e32ce1950961a4656712e1409df05df4e9eb98f768fb0dba564304c7f9527c'
).toString('base64');

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export const uploadToIPFS = async (file: File | Blob): Promise<string> => {
  try {
    const buffer = await file.arrayBuffer();
    const result = await ipfsClient.add(buffer);
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

export const getIPFSUrl = (hash: string): string => {
  return `https://ipfs.io/ipfs/${hash}`;
}; 