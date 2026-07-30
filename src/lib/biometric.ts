/**
 * Biometric verification - uses native Android bridge when in WebView,
 * falls back to WebAuthn for browsers.
 */

declare global {
  interface Window {
    AndroidBiometric?: {
      isAvailable(): boolean;
      authenticate(): void;
    };
  }
}

export async function verifyBiometric(): Promise<boolean> {
  // Try native Android bridge first (for WebView app)
  if (window.AndroidBiometric) {
    return verifyNativeAndroid();
  }

  // Fall back to WebAuthn for browsers
  return verifyWebAuthn();
}

/**
 * Native Android biometric via JavaScript interface
 */
function verifyNativeAndroid(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (!window.AndroidBiometric?.isAvailable()) {
        console.log("Android biometric not available");
        resolve(false);
        return;
      }

      // Listen for the result event from native code
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent;
        window.removeEventListener("biometricResult", handler);
        resolve(customEvent.detail?.success === true);
      };

      window.addEventListener("biometricResult", handler);

      // Set a timeout in case native never responds
      setTimeout(() => {
        window.removeEventListener("biometricResult", handler);
        resolve(false);
      }, 60000);

      // Trigger native biometric prompt
      window.AndroidBiometric!.authenticate();
    } catch (error) {
      console.log("Native biometric error:", error);
      resolve(false);
    }
  });
}

/**
 * WebAuthn-based biometric for desktop/browser
 */
async function verifyWebAuthn(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential) {
      console.log("WebAuthn not supported");
      return false;
    }

    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) {
      console.log("Platform authenticator not available");
      return false;
    }

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
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
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
    if (error.name === "InvalidStateError") {
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
    console.log("WebAuthn error:", error.message);
    return false;
  }
}
