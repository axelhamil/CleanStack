import { Column, Heading, Row, Section, Text } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";

interface PaymentConfirmationEmailProps {
  name: string;
  planName: string;
  amount: string;
  nextBillingDate: string;
  dashboardUrl: string;
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

const detailsSectionStyle: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  border: "2px solid #000000",
  padding: "24px",
  marginTop: "24px",
  marginBottom: "24px",
};

const detailRowStyle: React.CSSProperties = {
  marginBottom: "12px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  color: "#666666",
  width: "140px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#000000",
};

const buttonContainerStyle: React.CSSProperties = {
  marginTop: "32px",
  marginBottom: "32px",
  textAlign: "center" as const,
};

export function PaymentConfirmationEmail({
  name,
  planName,
  amount,
  nextBillingDate,
  dashboardUrl = "https://example.com/dashboard",
}: PaymentConfirmationEmailProps) {
  return (
    <EmailLayout preview="Payment confirmed">
      <Heading style={headingStyle}>Payment Confirmed</Heading>
      <Text style={textStyle}>Hi {name},</Text>
      <Text style={textStyle}>
        Thank you for your payment. Here are your subscription details:
      </Text>
      <Section style={detailsSectionStyle}>
        <Row style={detailRowStyle}>
          <Column style={labelStyle}>Plan:</Column>
          <Column style={valueStyle}>{planName}</Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={labelStyle}>Amount:</Column>
          <Column style={valueStyle}>${amount}</Column>
        </Row>
        <Row style={detailRowStyle}>
          <Column style={labelStyle}>Next billing:</Column>
          <Column style={valueStyle}>{nextBillingDate}</Column>
        </Row>
      </Section>
      <Text style={textStyle}>
        You can manage your subscription in your account settings at any time.
      </Text>
      <Section style={buttonContainerStyle}>
        <EmailButton href={dashboardUrl}>View Dashboard</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export async function renderPaymentConfirmationEmail(
  props: PaymentConfirmationEmailProps,
): Promise<string> {
  return await render(<PaymentConfirmationEmail {...props} />);
}

export default PaymentConfirmationEmail;
