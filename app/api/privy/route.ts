import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/app/constants";
import { encodeFunctionData } from "viem";

const APP_SECRET = process.env.PRIVY_APP_SECRET as string;
const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;
const AUTH_KEY = process.env.PRIVY_SIGNER_PRIVATE_KEY as string;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputValue = body?.inputValue;
    const walletId = body?.walletId;

    const privy = new PrivyClient(APP_ID, APP_SECRET);
    privy.walletApi.updateAuthorizationKey(AUTH_KEY);

    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: "store",
      args: [inputValue],
    });

    try {
      const { hash } = await privy.walletApi.ethereum.sendTransaction({
        walletId,
        caip2: "eip155:84532",
        transaction: {
          to: CONTRACT_ADDRESS,
          data,
          chainId: 84532,
        },
      });
      return NextResponse.json({ hash });
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError);
      return NextResponse.json(
        {
          error: "Transaction failed",
          details:
            transactionError instanceof Error
              ? transactionError.message
              : String(transactionError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
