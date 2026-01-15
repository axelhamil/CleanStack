import { Heading, Section, Text } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  borderBottom: "3px solid #000000",
  paddingBottom: "16px",
  marginBottom: "24px",
  color: "#000000",
};

const textStyle: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333333",
  margin: "16px 0",
};

const buttonContainerStyle: React.CSSProperties = {
  marginTop: "32px",
  marginBottom: "32px",
  textAlign: "center" as const,
};

const warningTextStyle: React.CSSProperties = {
  ...textStyle,
  color: "#666666",
  fontSize: "14px",
};

export function PasswordResetEmail({
  name,
  resetUrl = "https://example.com/reset-password",
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading style={headingStyle}>Reset Your Password</Heading>
      <Text style={textStyle}>Hi {name},</Text>
      <Text style={textStyle}>
        We received a request to reset your password. Click the button below to
        create a new password. This link will expire in 1 hour.
      </Text>
      <Section style={buttonContainerStyle}>
        <EmailButton href={resetUrl}>Reset Password</EmailButton>
      </Section>
      <Text style={warningTextStyle}>
        If you didn&apos;t request this, you can safely ignore this email. Your
        password will remain unchanged.
      </Text>
    </EmailLayout>
  );
}

export async function renderPasswordResetEmail(
  props: PasswordResetEmailProps,
): Promise<string> {
  return await render(<PasswordResetEmail {...props} />);
}

export default PasswordResetEmail;
