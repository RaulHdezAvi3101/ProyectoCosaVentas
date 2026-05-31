/**
 * Simula N clientes Socket intentando la misma frase FTC.
 *
 * Uso:
 *   npx tsx scripts/simulate-claim.ts live-charizard "charizard psa9" 10
 */
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../src/types/socket";

type ClaimSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const listingSlug = process.argv[2] ?? "live-charizard";
const clientCount = Number(process.argv.at(-1) ?? 5);
const phrase =
  process.argv.slice(3, -1).join(" ").trim() || "charizard psa9";
const baseUrl = process.env.SIMULATE_BASE_URL ?? "http://localhost:3000";

async function runClient(index: number): Promise<"won" | "lost" | "invalid"> {
  return new Promise((resolve, reject) => {
    const guestId = crypto.randomUUID();
    const socket: ClaimSocket = io(baseUrl, {
      path: "/socket.io",
      auth: {
        guestId,
        displayName: `Sim-${index}`,
      },
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error(`client ${index} timed out`));
    }, 10_000);

    let claimed = false;

    socket.on("connect", () => {
      socket.emit("listing:join", { listingId: listingSlug });
    });

    socket.on("listing:state", () => {
      if (claimed) {
        return;
      }
      claimed = true;
      socket.emit("claim:attempt", { listingId: listingSlug, phrase });
    });

    socket.on("claim:result", (result) => {
      clearTimeout(timeout);
      socket.disconnect();
      resolve(result.outcome);
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function main() {
  console.log(
    `Simulando ${clientCount} claims en ${listingSlug} contra ${baseUrl}`,
  );

  const outcomes = await Promise.all(
    Array.from({ length: clientCount }, (_, index) => runClient(index + 1)),
  );

  const winners = outcomes.filter((outcome) => outcome === "won").length;
  const losers = outcomes.filter((outcome) => outcome === "lost").length;
  const invalid = outcomes.filter((outcome) => outcome === "invalid").length;

  console.log({ winners, losers, invalid, outcomes });

  if (winners !== 1) {
    console.error("FAIL: se esperaba exactamente 1 ganador");
    process.exit(1);
  }

  console.log("PASS: un solo ganador");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
