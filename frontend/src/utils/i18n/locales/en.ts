const en = {
  translation: {
    common: {
      appName: "ApartmentManagement",
      back: "Back",
    },
    welcome: {
      title: "Welcome to ApartmentManagement!",
      description: "Manage your rental portfolio easily and transparently.",
      login: "Log In",
      register: "Register",
    },
    auth: {
      login: {
        title: "Login into the app",
        emailLabel: "Email",
        passwordLabel: "Password",
        submit: "LOGIN",
        footerPrompt: "Don't have an account?",
        footerAction: "Sign up",
        successToast: "Successfully signed in!",
        errorFallback: "Login failed",
        validation: {
          emailRequired: "Email is required",
          passwordRequired: "Password is required",
        },
      },
      register: {
        title: "Register into the application",
        tenantInvitationTitle: "Accept your tenant invitation",
        tenantInvitationInfo:
          "You have been invited as a Tenant. Complete the form below to activate your account and access the apartment your Landlord assigned you.",
        emailLabel: "Email",
        phoneLabel: "Phone number",
        passwordLabel: "Password",
        invitationCodeLabel: "Invitation code (optional)",
        submit: "REGISTER",
        footerPrompt: "Already have an account?",
        footerAction: "Log in",
        errorFallback: "Registration failed",
        validation: {
          emailRequired: "Email is required",
          emailInvalid: "Invalid email address",
          passwordRequired: "Password is required",
          passwordMin: "Password must be at least 6 characters",
          phoneRequired: "Phone number is required",
          phoneInvalid: "Invalid phone number",
        },
      },
    },
  },
};

export default en;
