import { useActionState } from "react";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Form } from "@/components/form/form";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";


const CreateProcessForm = () => {
  const [actionState, action] = useActionState(
    createProcess,
    EMPTY_ACTION_STATE
  );

  return (
    <div className="w-full max-w-md">
      <Form action={action} actionState={actionState}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Create a new process </FieldLegend>
            <FieldDescription>
              Enter the details of the process to create a new one.
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="processTitle">
                  Title
                </FieldLabel>
                <Input
                  id="processTitle"
                  placeholder="Process Title"
                  name="processTitle"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="processDescription">
                  Description
                </FieldLabel>
                <Input
                  id="processDescription"
                  name="processDescription"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter a short description of the process.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Process Category</FieldLegend>
            <FieldDescription>
              Select the category of the process or create a new one.
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox
                  id="newProcessCategory"
                  name="newProcessCategory"
                  defaultChecked
                />
                <FieldLabel
                  htmlFor="newProcessCategory"
                  className="font-normal"
                >
                  New Category
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
};

export { CreateProcessForm };
