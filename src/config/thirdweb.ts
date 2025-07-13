import { createThirdwebClient } from "thirdweb";

// Create the thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// You can get your client ID from https://thirdweb.com/dashboard
// Add this to your .env file:
// EXPO_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
