import * as React from "react";
import { Alert } from "react-bootstrap";
import styled from "styled-components";

import {
  welcomeMessageBgColor,
  welcomeMessageBorderColor,
} from "../../styles";

import "./WelcomeMessage.css";

const WelcomeMessageContainer = styled(Alert)`
  background-color: ${welcomeMessageBgColor};
  border: 1px solid ${welcomeMessageBorderColor} !important;
`;

const WelcomeMessage = () => (
  <WelcomeMessageContainer className="welcome-message">
    <p>
      <strong>Welcome!</strong> Mosaic is an app for recursive
      question-answering with pointers. You can browse public question-answer
      trees below or create private ones by signing up.
    </p>
    <p>
      This is an alpha version with bugs, missing features, and usability
      issues. You can check out{" "}
      <a href="https://github.com/oughtinc/mosaic">the code</a> and{" "}
      <a href="https://ought.org/projects/factored-cognition">
        learn more about the project
      </a>.
    </p>
  </WelcomeMessageContainer>
);

export { WelcomeMessage };
