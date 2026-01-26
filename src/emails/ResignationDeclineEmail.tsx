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

interface ResignationDeclineEmailProps {
    employeeName: string;
}

export const ResignationDeclineEmail = ({
    employeeName,
}: ResignationDeclineEmailProps) => (
    <Html>
        <Head />
        <Preview>Update Regarding Your Resignation</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Update Regarding Your Resignation</Heading>
                <Text style={text}>Dear {employeeName},</Text>
                <Text style={text}>
                    We have reviewed your resignation notice and require further discussion or clarification before proceeding.
                </Text>
                <Text style={text}>
                    Please contact your HR representative or supervisor directly to resolve this matter.
                </Text>
                <Section style={footer}>
                    <Text style={footerText}>
                        Retention Intelligence Hub
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default ResignationDeclineEmail;

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
