import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Section,
} from "@react-email/components";
import * as React from "react";
import { BRAND_COLORS } from "@/constants/brand";

interface ExitInvitationEmailProps {
    employeeName: string;
    actionUrl: string;
}

export const ExitInvitationEmail = ({
    employeeName,
    actionUrl,
}: ExitInvitationEmailProps) => (
    <Html>
        <Head />
        <Preview>Exit Process Invitation</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Exit Process Invitation</Heading>
                <Text style={text}>Dear {employeeName},</Text>
                <Text style={text}>
                    We have received notice of your resignation. To ensure a smooth transition, we invite you to complete the formal exit process.
                </Text>
                <Text style={text}>
                    Please click the button below to sign in and access your exit form.
                </Text>
                <Section style={btnContainer}>
                    <Button style={button} href={actionUrl}>
                        Start Exit Process
                    </Button>
                </Section>
                <Text style={text}>
                    If you have any questions, please contact the HR department.
                </Text>
                <Section style={footer}>
                    <Text style={footerText}>
                        This is an automated message from the Retention Intelligence Hub.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default ExitInvitationEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
};

const h1 = {
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.1",
    margin: "0 0 24px",
};

const text = {
    fontSize: "16px",
    lineHeight: "1.4",
    color: "#484848",
    marginBottom: "24px",
};

const btnContainer = {
    textAlign: "center" as const,
    marginBottom: "24px",
};

const button = {
    backgroundColor: BRAND_COLORS.primary, // Corporate Blue
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
};

const footer = {
    borderTop: "1px solid #eaeaea",
    marginTop: "24px",
    paddingTop: "24px",
};

const footerText = {
    fontSize: "14px",
    color: "#9ca299",
};
