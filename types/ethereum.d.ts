interface RequestArguments {
  method: string;
  params?: unknown[];
}

interface EthereumProvider {
  request(args: RequestArguments): Promise<string[]>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export type { RequestArguments, EthereumProvider }; 