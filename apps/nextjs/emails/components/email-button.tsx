import { Button } from "@react-email/components";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#000000",
  borderRadius: "0",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  border: "3px solid #000000",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button style={buttonStyle} href={href}>
      {children}
    </Button>
  );
}
