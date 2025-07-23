module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Allow unused variables that start with underscore
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_" 
    }],
    // Allow console.log in development
    "no-console": "off",
    // Allow any type when necessary
    "@typescript-eslint/no-explicit-any": "warn",
    // Allow img tags (Next.js Image optimization is optional)
    "@next/next/no-img-element": "warn",
    // React hooks exhaustive deps as warning instead of error
    "react-hooks/exhaustive-deps": "warn"
  }
}