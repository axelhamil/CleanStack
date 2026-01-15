import { Body, Container, Head, Html, Preview } from "@react-email/components";
import { EmailFooter } from "./email-footer";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: "0",
  padding: "0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 48px",
  marginTop: "32px",
  marginBottom: "32px",
  maxWidth: "600px",
  border: "3px solid #000000",
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {children}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
