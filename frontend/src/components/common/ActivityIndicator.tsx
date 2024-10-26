import React, { FC } from "react";
import Lottie from "lottie-react";
import LoadingAnimation from "../../assets/animations/LoadingAnimation.json";

type Props = {
  style?: React.CSSProperties;
};

export const ActivityIndicator: FC<Props> = ({ style }) => (
  <Lottie animationData={LoadingAnimation} loop style={style} />
);
