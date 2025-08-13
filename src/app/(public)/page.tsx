import Image from "next/image";
import { Fragment } from "react";
import Hero from "../../components/public/Hero";
import Logos from "../../components/public/Logos";
import Container from "../../components/public/Container";

export default function Home() {
  return (
    <Fragment>
      <Hero/>
      <Logos/>
      <Container>
        
      </Container>
    </Fragment>
  );
}
