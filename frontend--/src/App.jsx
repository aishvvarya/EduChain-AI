import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import "./App.css";

const achievements = [
  {
    id: 1,
    title: "Completed Data Structures",
    detail: "Arrays, linked lists, trees, graphs",
  },
  {
    id: 2,
    title: "Completed Python Basics",
    detail: "Variables, loops, functions",
  },
  {
    id: 3,
    title: "Completed Mathematics Module",
    detail: "Algebra, calculus, statistics",
  },
];

const mockAnswers = {
  "what is blockchain":
    "Blockchain is a distributed digital ledger that records information in a secure and tamper-resistant way.",
  "what is react":
    "React is a JavaScript library used to build interactive user interfaces.",
  "what is ai":
    "Artificial Intelligence allows computers to perform tasks that normally require human intelligence.",
  "what is ethereum":
    "Ethereum is a blockchain platform that supports smart contracts and decentralized applications.",
};

function getMockAnswer(question) {
  const normalized = question.toLowerCase().trim();

  for (const key of Object.keys(mockAnswers)) {
    if (normalized.includes(key)) {
      return mockAnswers[key];
    }
  }

  return `AI response: "${question}" is an interesting learning topic. Try breaking it into smaller concepts and studying each part step by step.`;
}

function App() {
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const [claimedIds, setClaimedIds] = useState([]);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // =========================
  // ASK AI
  // =========================
  function handleAsk() {
    if (!question.trim()) {
      setError("Please enter a question first.");
      return;
    }

    setError("");
    setNotice("");
    setIsLoading(true);
    setAskedQuestion(question);
    setAnswer("");

    setTimeout(() => {
      setAnswer(getMockAnswer(question));
      setIsLoading(false);
    }, 1200);
  }

  // =========================
  // CONNECT METAMASK
  // =========================
  async function handleConnect() {
    try {
      setError("");
      setNotice("");

      if (!window.ethereum) {
        setError(
          "MetaMask is not installed. Please install MetaMask first."
        );
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();

      if (network.chainId !== 31337n) {
        setWalletConnected(false);
        setWalletAddress("");

        setError(
          "Please switch MetaMask to Hardhat Local (Chain ID 31337)."
        );

        return;
      }

      setWalletAddress(address);
      setWalletConnected(true);

      setNotice("MetaMask connected successfully.");
    } catch (error) {
      console.error("CONNECT ERROR:", error);

      setWalletConnected(false);
      setWalletAddress("");

      setError(
        "Wallet connection was cancelled or failed."
      );
    }
  }

  // =========================
  // CLAIM CREDENTIAL
  // =========================
  async function handleClaim(item) {
    if (!walletConnected) {
      setNotice(
        "Please connect MetaMask before claiming a credential."
      );
      return;
    }

    try {
      setError("");
      setNotice("Preparing blockchain transaction...");

      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const address = await signer.getAddress();

      setNotice(
        "Please confirm the transaction in MetaMask..."
      );

      const transaction =
        await contract.issueCredential(
          address,
          item.title
        );

      setNotice(
        "Transaction submitted. Waiting for confirmation..."
      );

      await transaction.wait();

      setClaimedIds((current) => {
        if (current.includes(item.id)) {
          return current;
        }

        return [...current, item.id];
      });

      setNotice(
        `Credential successfully recorded on Hardhat Local: "${item.title}" ✓`
      );
    } catch (error) {
      console.error("CLAIM ERROR:", error);

      if (
        error?.code === "ACTION_REJECTED" ||
        error?.code === 4001
      ) {
        setError(
          "Transaction was cancelled in MetaMask."
        );
      } else {
        setError(
          "Credential transaction failed. Make sure MetaMask is using the Hardhat account that deployed the contract."
        );
      }
    }
  }

  // =========================
  // VERIFY CREDENTIAL
  // =========================
  async function handleVerify(item) {
    try {
      setError("");
      setNotice("Checking blockchain...");

      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      const provider = new ethers.BrowserProvider(
        window.ethereum
      );

      const network = await provider.getNetwork();

      if (network.chainId !== 31337n) {
        setError(
          "Please switch MetaMask to Hardhat Local (Chain ID 31337)."
        );
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      console.log("VERIFYING BLOCKCHAIN CREDENTIAL");

      console.log("Contract:", CONTRACT_ADDRESS);

      console.log("Student:", walletAddress);

      console.log("Achievement:", item.title);

      const result =
        await contract.verifyCredential(
          walletAddress,
          item.title
        );

      console.log("Blockchain result:", result);

      const exists = result[0];
      const issuedAt = result[1];

      if (exists) {
        const date = new Date(
          Number(issuedAt) * 1000
        );

        setNotice(
          `✓ Credential verified on blockchain! Issued: ${date.toLocaleString()}`
        );
      } else {
        setNotice(
          `Credential "${item.title}" was not found on the blockchain.`
        );
      }
    } catch (error) {
      console.error("VERIFY ERROR:", error);

      setError(
        `Verification failed: ${
          error?.shortMessage ||
          error?.reason ||
          error?.message ||
          "Unknown blockchain error"
        }`
      );
    }
  }

  // =========================
  // SHORT WALLET ADDRESS
  // =========================
  function shortenAddress(address) {
    if (!address) {
      return "";
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-icon">
            🎓
          </div>

          <div>
            <h1>EduChain AI</h1>

            <p>
              AI-Powered Academic Credentials
            </p>
          </div>

        </div>

        <button
          className={
            walletConnected
              ? "btn btn-wallet connected"
              : "btn btn-wallet"
          }
          onClick={handleConnect}
        >
          {walletConnected
            ? `Wallet Connected ✓ ${shortenAddress(
                walletAddress
              )}`
            : "Connect MetaMask"}
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main className="container">

        {/* ================= HERO ================= */}

        <section className="hero">

          <div className="hero-badge">
            🚀 Blockchain + AI Education Platform
          </div>

          <h2>
            Learn Smarter.
            <br />

            <span>
              Own Your Achievements.
            </span>
          </h2>

          <p>
            Ask AI questions, complete learning modules,
            and store verified academic credentials
            on the blockchain.
          </p>

        </section>

        {/* ================= STATUS ================= */}

        {(notice || error) && (
          <div
            className={
              error
                ? "status-message error"
                : "status-message success"
            }
          >
            {error || notice}
          </div>
        )}

        {/* ================= AI ASSISTANT ================= */}

        <section className="card">

          <div className="section-heading">

            <div className="section-icon">
              🤖
            </div>

            <div>

              <h2>
                AI Learning Assistant
              </h2>

              <p>
                Ask questions and get instant
                learning assistance.
              </p>

            </div>

          </div>

          <div className="question-box">

            <input
              type="text"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAsk();
                }
              }}
              placeholder="Ask something like: What is blockchain?"
            />

            <button
              className="btn btn-primary"
              onClick={handleAsk}
              disabled={isLoading}
            >
              {isLoading
                ? "Thinking..."
                : "Ask AI"}
            </button>

          </div>

          {askedQuestion && (

            <div className="ai-result">

              <p className="question-label">
                Your Question
              </p>

              <p className="question-text">
                {askedQuestion}
              </p>

              {isLoading ? (

                <div className="loading">
                  AI is thinking...
                </div>

              ) : (

                <>

                  <p className="answer-label">
                    AI Answer
                  </p>

                  <p className="answer-text">
                    {answer}
                  </p>

                </>

              )}

            </div>

          )}

        </section>

        {/* ================= ACHIEVEMENTS ================= */}

        <section className="card">

          <div className="section-heading">

            <div className="section-icon">
              🏆
            </div>

            <div>

              <h2>
                Academic Achievements
              </h2>

              <p>
                Claim your completed achievements
                as blockchain credentials.
              </p>

            </div>

          </div>

          <div className="achievements-grid">

            {achievements.map((item) => {

              const claimed =
                claimedIds.includes(item.id);

              return (

                <div
                  className="achievement-card"
                  key={item.id}
                >

                  <div className="achievement-icon">
                    ✓
                  </div>

                  <div className="achievement-content">

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.detail}
                    </p>

                    {!claimed ? (

                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          handleClaim(item)
                        }
                      >
                        Claim Credential
                      </button>

                    ) : (

                      <>

                        <button
                          className="btn btn-success"
                          disabled
                        >
                          Credential Claimed ✓
                        </button>

                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleVerify(item)
                          }
                        >
                          Verify on Blockchain
                        </button>

                      </>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        </section>

        {/* ================= HOW IT WORKS ================= */}

        <section className="card">

          <div className="section-heading">

            <div className="section-icon">
              ⛓️
            </div>

            <div>

              <h2>
                How EduChain AI Works
              </h2>

              <p>
                A simple learning-to-credential
                pipeline.
              </p>

            </div>

          </div>

          <div className="steps">

            <div className="step">

              <div className="step-number">
                1
              </div>

              <div>

                <h3>
                  Learn
                </h3>

                <p>
                  Use the AI assistant to explore
                  educational topics.
                </p>

              </div>

            </div>

            <div className="step">

              <div className="step-number">
                2
              </div>

              <div>

                <h3>
                  Achieve
                </h3>

                <p>
                  Complete academic modules and
                  unlock achievements.
                </p>

              </div>

            </div>

            <div className="step">

              <div className="step-number">
                3
              </div>

              <div>

                <h3>
                  Claim
                </h3>

                <p>
                  Record your achievement as a
                  blockchain credential.
                </p>

              </div>

            </div>

            <div className="step">

              <div className="step-number">
                4
              </div>

              <div>

                <h3>
                  Verify
                </h3>

                <p>
                  Verify the credential directly
                  from the blockchain.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer>

        <p>
          EduChain AI • Built with React,
          Ethereum & AI
        </p>

      </footer>

    </div>
  );
}

export default App;