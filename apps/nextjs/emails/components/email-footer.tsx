import { Hr, Section, Text } from "@react-email/components";

const footerStyle: React.CSSProperties = {
  marginTop: "32px",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e6e6e6",
  margin: "20px 0",
};

const footerTextStyle: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};

export function EmailFooter() {
  return (
    <Section style={footerStyle}>
      <Hr style={hrStyle} />
      <Text style={footerTextStyle}>
        You received this email because you signed up for our service.
      </Text>
      <Text style={footerTextStyle}>
        &copy; {new Date().getFullYear()} AppName. All rights reserved.
      </Text>
    </Section>
  );
}
