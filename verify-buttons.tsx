import React from "react";
import { FaPlus } from "react-icons/fa";
import Button from "../components/headless/Button";
import Container from "../components/headless/Container";
import PrimaryButton from "../components/style/PrimaryButton";

const vb = () => {
    return (
        <Container>
            <div className="flex items-center gap-4 mb-10">
                <Button href={"/"}>Return home</Button>
                <Button onClick={() => console.log("You clicked me")}>Free trial</Button>
                <Button onClick={() => console.log("You clicked the stylized button")} className="bg-blue-800 hover:bg-black text-white">
                    Free trial
                </Button>
                <Button href={"https://lauragao.ca"} className="bg-blue-800 hover:bg-black text-white">
                    Leave our site
                </Button>
                <div className="bg-black w-8 h-8 relative">
                    <div className="loading-spinner"></div>
                </div>
                <div className="gradient-border w-8 h-8 bg-black"></div>
                <div className="spin2"></div>
            </div>
            <p className="grounded-radiants">
                Sme text is here
                <br />
                There is even a line break!
            </p>
            <div className="box mt-10"></div>
            <PrimaryButton className="mt-5" childClassName="flex items-center" isLoading={true} onClick={() => console.log("you clicked me!")}>
                <FaPlus />
                <span>Click me</span>
            </PrimaryButton>
            <PrimaryButton className="mt-5" childClassName="flex items-center" onClick={() => console.log("you clicked me!")}>
                <FaPlus />
                <span>Click me</span>
            </PrimaryButton>
        </Container>
    );
};

export default vb;
