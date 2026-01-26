import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Section,
} from "@react-email/components";
import * as React from "react";

interface ResignationAckEmailProps {
    employeeName: string;
}

export const ResignationAckEmail = ({
    employeeName,
}: ResignationAckEmailProps) => (
    <Html>
        <Head />
        <Preview>Resignation Notice Received</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Resignation Notice Received</Heading>
                <Text style={text}>Dear {employeeName},</Text>
                <Text style={text}>
                    This email confirms that we have received your resignation notice.
                </Text>
                <Text style={text}>
                    Our HR team will review your submission and contact you shortly regarding the next steps, including your exit interview schedule.
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

export default ResignationAckEmail;

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

const footer = {
    borderTop: "1px solid #eaeaea",
    marginTop: "24px",
    paddingTop: "24px",
};

const footerText = {
    fontSize: "14px",
    color: "#9ca299",
};
