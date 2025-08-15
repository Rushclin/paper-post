import { Fragment } from "react";
import Hero from "../../components/public/Hero";
import Container from "../../components/public/Container";
import Categories from "@/src/components/public/Categories";
import LatestArticles from "@/src/components/public/LatestArticles";

export default function Home() {
  return (
    <Fragment>
      <Hero/>
      <Container>
        <Categories/>
        <LatestArticles/>
      </Container>
    </Fragment>
  );
}
