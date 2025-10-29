import { ProcessContent, Step } from "../steps-editor";

const generateId = () =>
  `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const createEmptyStep = (): Step => ({
  id: generateId(),
  title: "",
  description: "",
  isExpanded: true,
});

export const updateSteps = (
  setSteps: (steps: Step[]) => void,
  newSteps: Step[],
  onChange: (content: ProcessContent) => void,
  content: ProcessContent,
) => {
  setSteps(newSteps);
  onChange({ ...content, steps: newSteps });
};

export const addStep = (
  steps: Step[],
  updateSteps: (steps: Step[]) => void,
  afterIndex?: number
) => {
  const newStep = createEmptyStep();
  const newSteps = [...steps];

  if (afterIndex !== undefined) {
    newSteps.splice(afterIndex + 1, 0, newStep);
  } else {
    newSteps.push(newStep);
  }
  updateSteps(newSteps);
};

export const deleteStep = (
  stepId: string,
  steps: Step[],
  updateSteps: (steps: Step[]) => void,
) => {
  const newSteps = steps.filter((step) => step.id !== stepId);
  updateSteps(newSteps.length > 0 ? newSteps : [createEmptyStep()]);
};

export const updateStepTitle = (
  stepId: string,
  title: string,
  steps: Step[],
  updateSteps: (steps: Step[]) => void,
) => {
  const newSteps = steps.map((step) =>
    step.id === stepId ? { ...step, title } : step
  );
  updateSteps(newSteps);
};

export const updateStepDescription = (
  stepId: string,
  description: string,
  steps: Step[],
  updateSteps: (steps: Step[]) => void,
) => {
  const newSteps = steps.map((step) =>
    step.id === stepId ? { ...step, description } : step
  );
  updateSteps(newSteps);
};

export const toggleStepExpand = (
  stepId: string,
  steps: Step[],
  updateSteps: (steps: Step[]) => void,
) => {
  const newSteps = steps.map((step) =>
    step.id === stepId ? { ...step, isExpanded: !step.isExpanded } : step
  );
  updateSteps(newSteps);
};
