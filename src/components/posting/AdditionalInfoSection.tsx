import { type ProductFormError } from "@/utils/validation";
import AtomicQuestionInputField, { type AtomicAnswer } from "./AtomicQuestion";
import MultipleChoiceQuestionInputField, {
  type MultipleChoiceAnswer,
} from "./MultipleChoiceQuestion";
import { type SingleModelPayloadIncluded } from "@/types/prisma";
import React from "react";

interface AdditionalInfoSectionProps {
  model: SingleModelPayloadIncluded;
  atomicAnswers: AtomicAnswer[];
  setAtomicAnswers: (
    value: AtomicAnswer[] | ((prev: AtomicAnswer[]) => AtomicAnswer[]),
  ) => void;
  multipleChoiceAnswers: MultipleChoiceAnswer[];
  setMultipleChoiceAnswers: (
    value:
      | MultipleChoiceAnswer[]
      | ((prev: MultipleChoiceAnswer[]) => MultipleChoiceAnswer[]),
  ) => void;
  formError: ProductFormError;
}

function AdditionalInfoSection({
  model,
  atomicAnswers,
  setAtomicAnswers,
  multipleChoiceAnswers,
  setMultipleChoiceAnswers,
  formError,
}: AdditionalInfoSectionProps) {
  if (
    model.atomicQuestions.length === 0 &&
    model.multipleChoiceQuestions.length === 0
  ) {
    return null;
  }

  return (
    <>
      <section>
        {/* additional questions */}
        <h2 className="my-4 text-xl font-bold">
          Tell us about your {model.name}
        </h2>
        <div className="flex flex-col gap-6">
          {model.atomicQuestions.map((question, i) => (
            <AtomicQuestionInputField
              key={question.id}
              question={question}
              answer={
                atomicAnswers.find(
                  (answer) => answer.questionId === question.id,
                )!
              }
              index={i + 1}
              onChange={(value) => {
                setAtomicAnswers((prev) => {
                  return prev.map((prevAnswer) => {
                    if (prevAnswer.questionId === question.id) {
                      return value;
                    }
                    return prevAnswer;
                  });
                });
              }}
              error={formError.atomicAnswers?.[i]}
            />
          ))}

          {model.multipleChoiceQuestions.map((question, i) => (
            <MultipleChoiceQuestionInputField
              key={question.id}
              question={question}
              index={model.atomicQuestions.length + i + 1}
              answer={
                multipleChoiceAnswers.find(
                  (answer) => answer.questionId === question.id,
                )!
              }
              onChange={(answer) => {
                setMultipleChoiceAnswers((prev) => {
                  return prev.map((prevAnswer) => {
                    if (prevAnswer.questionId === question.id) {
                      return answer;
                    }
                    return prevAnswer;
                  });
                });
              }}
              error={formError.multipleChoiceAnswers?.[i]}
            />
          ))}
        </div>
      </section>
      <hr className="my-6" />
    </>
  );
}

export default React.memo(AdditionalInfoSection);
