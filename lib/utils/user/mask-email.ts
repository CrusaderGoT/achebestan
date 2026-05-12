export const maskEmail = (email: string) => {
    const [user, domain] = email.split("@");
    return `${user.charAt(0)}***${user.charAt(user.length - 1)}@${domain}`;
};
