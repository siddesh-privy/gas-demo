"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { createPublicClient, http } from "viem";
import { baseSepolia, mainnet } from "viem/chains";

export const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
