const pl = {
  translation: {
    common: {
      appName: "ApartmentManagement",
      back: "Wstecz",
    },
    welcome: {
      title: "Witaj w ApartmentManagement!",
      description:
        "Zarządzaj swoim portfelem wynajmu łatwo i przejrzyście.",
      login: "Zaloguj się",
      register: "Zarejestruj się",
    },
    auth: {
      login: {
        title: "Zaloguj się do aplikacji",
        emailLabel: "Adres e-mail",
        passwordLabel: "Hasło",
        submit: "ZALOGUJ SIĘ",
        footerPrompt: "Nie masz konta?",
        footerAction: "Zarejestruj się",
        successToast: "Pomyślnie zalogowano do konta!",
        errorFallback: "Logowanie nie powiodło się",
        validation: {
          emailRequired: "Adres e-mail jest wymagany",
          passwordRequired: "Hasło jest wymagane",
        },
      },
      register: {
        title: "Zarejestruj się w aplikacji",
        tenantInvitationTitle: "Zaakceptuj zaproszenie najemcy",
        tenantInvitationInfo:
          "Zostałeś zaproszony jako Najemca. Wypełnij formularz poniżej, aby aktywować konto i uzyskać dostęp do mieszkania przypisanego przez Wynajmującego.",
        emailLabel: "Adres e-mail",
        phoneLabel: "Numer telefonu",
        passwordLabel: "Hasło",
        invitationCodeLabel: "Kod zaproszenia (opcjonalnie)",
        submit: "ZAREJESTRUJ SIĘ",
        footerPrompt: "Masz już konto?",
        footerAction: "Zaloguj się",
        errorFallback: "Rejestracja nie powiodła się",
        validation: {
          emailRequired: "Adres e-mail jest wymagany",
          emailInvalid: "Nieprawidłowy adres e-mail",
          passwordRequired: "Hasło jest wymagane",
          passwordMin: "Hasło musi mieć co najmniej 6 znaków",
          phoneRequired: "Numer telefonu jest wymagany",
          phoneInvalid: "Nieprawidłowy numer telefonu",
        },
      },
    },
  },
};

export default pl;
