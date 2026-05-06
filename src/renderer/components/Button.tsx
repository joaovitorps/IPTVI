import React from "react";
import { Link } from "react-router";

export const Button = ({
  children,
  path,
  ...props
}: {
  children: React.ReactNode;
  path: string;
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
