"use client";

import { usePrivy, useSessionSigners, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { viemClient } from "./providers/providers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./constants";

export default function Home() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { addSessionSigners } = useSessionSigners();
  const [inputValue, setInputValue] = useState(0);
  const [numberInContract, setNumberInContract] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const addSessionSignerToWallet = async () => {
      await addSessionSigners({
        address: wallets[0].address,
        signers: [
          {
            signerId: process.env.NEXT_PUBLIC_PRIVY_SIGNER_ID! as string,
            policyIds: [],
          },
        ],
      });
    };
    addSessionSignerToWallet();
  }, [wallets]);
  const readFromContract = async () => {
    const data = await viemClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "retrieve",
    });
    setNumberInContract(Number(data));
  };
  useEffect(() => {
    readFromContract();
  }, []);
  const writeToContract = async () => {
    try {
      setIsLoading(true);
      setError(""); // Clear any previous errors
      setSuccess(""); // Clear any previous success messages
      const response = await fetch("/api/privy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputValue,
          walletId: user?.wallet?.id, // Using first wallet
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.details ||
            result.error ||
            `HTTP error! status: ${response.status}`
        );
        return;
      }

      console.log("Transaction hash:", result.hash);
      setSuccess(result.hash);
      readFromContract();
      return result;
    } catch (error) {
      console.error("Error calling contract:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Next.js + Privy App</h1>
        <div style={cardStyle}>
          <div style={loadingStyle}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Next.js + Privy App</h1>
      <div style={cardStyle}>
        <p style={textStyle}>
          {authenticated ? "You're logged in! 🎉" : "Please log in to continue"}
        </p>

        {authenticated ? (
          <>
            <button onClick={logout} style={logoutButtonStyle}>
              Logout
            </button>
            <div style={walletInfoStyle}>
              <label style={walletLabelStyle}>Wallet Address</label>
              <p style={walletAddressStyle}>{wallets[0]?.address}</p>
            </div>
            <div style={walletInfoStyle}>
              <label style={walletLabelStyle}>Number in Contract</label>
              <p style={walletAddressStyle}>{numberInContract}</p>
            </div>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  width: "140px",
                  color: "black",
                }}
              />
              <button
                onClick={writeToContract}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? "#6b7280" : "#1a1a1a",
                  color: "white",
                  border: "none",
                  padding: "0.625rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Writing..." : "Write"}
              </button>
            </div>
            {error && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  color: "#dc2626",
                  fontSize: "0.875rem",
                }}
              >
                <strong>Error:</strong> {error}
              </div>
            )}
            {success && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  color: "#166534",
                  fontSize: "0.875rem",
                }}
              >
                <strong>Success!</strong> Transaction completed.{" "}
                <a
                  href={`https://sepolia.basescan.org/tx/${success}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#166534",
                    textDecoration: "underline",
                    fontWeight: "500",
                  }}
                >
                  View in Explorer
                </a>
              </div>
            )}
          </>
        ) : (
          <button onClick={login} style={loginButtonStyle}>
            Login with Privy
          </button>
        )}
      </div>
      <div style={instructionsStyle}>
        <p>
          📁 Visit <code>/app/providers/providers.tsx</code> to view and update
          your Privy config
        </p>
        <p>
          🎉 Your app is now fully integrated with Privy! You can now provision
          embedded wallets, smart wallets for your users and much more.
        </p>
        <p>
          📖 Read more in docs:{" "}
          <a
            href="https://docs.privy.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
          >
            https://docs.privy.io/
          </a>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fefefe",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "1rem",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "3rem 2rem",
  borderRadius: "16px",
  border: "1px solid #f0f0f0",
  textAlign: "center" as const,
  maxWidth: "420px",
  width: "100%",
};

const titleStyle = {
  fontSize: "2rem",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "0.5rem",
};

const textStyle = {
  fontSize: "1rem",
  color: "#666666",
  marginBottom: "2.5rem",
  lineHeight: "1.5",
};

const loginButtonStyle = {
  backgroundColor: "#1a1a1a",
  color: "white",
  border: "none",
  padding: "0.875rem 2rem",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  width: "100%",
  maxWidth: "200px",
};

const logoutButtonStyle = {
  backgroundColor: "#f5f5f5",
  color: "#333333",
  border: "none",
  padding: "0.875rem 2rem",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s ease",
  width: "100%",
  maxWidth: "200px",
};

const loadingStyle = {
  fontSize: "1rem",
  color: "#666666",
};

const instructionsStyle = {
  marginTop: "2rem",
  padding: "1.5rem",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  fontSize: "0.875rem",
  color: "#666666",
  textAlign: "center" as const,
};

const linkStyle = {
  color: "#1a1a1a",
  textDecoration: "underline",
};

const warningStyle = {
  color: "#d97706",
  fontWeight: "500",
};

const walletInfoStyle = {
  marginTop: "1.5rem",
  padding: "1rem",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  border: "1px solid #e9ecef",
};

const walletLabelStyle = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: "500",
  color: "#495057",
  marginBottom: "0.5rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.025em",
};

const walletAddressStyle = {
  fontSize: "0.875rem",
  color: "#1a1a1a",
  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
  backgroundColor: "white",
  padding: "0.75rem",
  borderRadius: "6px",
  border: "1px solid #dee2e6",
  wordBreak: "break-all" as const,
  margin: "0",
  lineHeight: "1.4",
};
