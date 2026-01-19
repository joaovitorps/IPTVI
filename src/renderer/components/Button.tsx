import { Link } from "react-router";
import React from "react";

const Button = ({
  children,
  path = null,
  ...props
}: {
  children: React.ReactNode;
  path: string | null;
}) => {
  return (
    <Link
      to={path}
      className="bg-purple-500 cursor-pointer p-1 rounded-md"
      {...props}
    >
      {children}
    </Link>
  );
};

export default Button;
