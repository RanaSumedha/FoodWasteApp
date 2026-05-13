import React from "react";

function OAuthButton({ provider = "google", onClick }) {
  return (
    <button type="button" onClick={onClick}>
      Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </button>
  );
}

export default OAuthButton;
