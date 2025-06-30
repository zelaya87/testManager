import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconType } from "react-icons";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signIn, signOut, useSession } from "next-auth/react";

const Auth = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();

  if (session) {
    return (
      <Card className="w-[350px] mx-auto mt-20">
        <CardHeader>
          <CardTitle>Logado como</CardTitle>
          <CardDescription>{session.user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => signOut()}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[350px] mx-auto mt-20">
      <CardHeader>
        <CardTitle>Bem-vindo</CardTitle>
        <CardDescription>Faça login para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("google")}
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Entrar com Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default Auth;
