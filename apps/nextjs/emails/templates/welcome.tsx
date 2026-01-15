import { Heading, Section, Text } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
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

export function WelcomeEmail({
  name,
  loginUrl = "https://example.com/dashboard",
}: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to AppName, ${name}!`}>
      <Heading style={headingStyle}>Welcome!</Heading>
      <Text style={textStyle}>Hi {name},</Text>
      <Text style={textStyle}>
        Thank you for signing up. We&apos;re excited to have you on board. Get
        started by exploring your dashboard.
      </Text>
      <Section style={buttonContainerStyle}>
        <EmailButton href={loginUrl}>Go to Dashboard</EmailButton>
      </Section>
      <Text style={textStyle}>
        If you have any questions, reply to this email. We&apos;re here to help!
      </Text>
    </EmailLayout>
  );
}

export async function renderWelcomeEmail(
  props: WelcomeEmailProps,
): Promise<string> {
  return await render(<WelcomeEmail {...props} />);
}

export default WelcomeEmail;
