/**
 * Biometric verification using Web Authentication API.
 * Triggers the device's built-in biometric (fingerprint, face ID, Windows Hello).
 * Returns true if verified, false if unavailable or denied.
 */
export async function verifyBiometric(): Promise<boolean> {
  try {
    // Check if WebAuthn is available
    if (!window.PublicKeyCredential) {
      console.log("WebAuthn not supported");
      return false;
    }

    // Check if platform authenticator (biometric) is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) {
      console.log("Platform authenticator not available");
      return false;
    }

    // Create a simple challenge for biometric verification
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: "GeoAttend",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: "attendance-verify",
          displayName: "Attendance Verification",
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },   // ES256
          { alg: -257, type: "public-key" },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      },
    });

    return credential !== null;
  } catch (error: any) {
    // User cancelled or biometric failed
    if (error.name === "NotAllowedError") {
      console.log("User cancelled biometric verification");
    } else if (error.name === "InvalidStateError") {
      // Credential already exists, try to verify with get() instead
      try {
        return await verifyWithGet();
      } catch {
        return false;
      }
    } else {
      console.log("Biometric error:", error.message);
    }
    return false;
  }
}

async function verifyWithGet(): Promise<boolean> {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
      },
    });

    return assertion !== null;
  } catch {
    return false;
  }
}
