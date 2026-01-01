export function validateDepartmentForm(data: {
    departmentName: string;
    teamName1: string;
    teamName2?: string;
    teamName3?: string;
  }): { valid: boolean; error?: string } {
    if (!data.departmentName.trim()) {
      return { valid: false, error: "Department name is required" };
    }
    if (!data.teamName1.trim()) {
      return { valid: false, error: "Team name is required" };
    }
    if (data.departmentName.trim().length > 28) {
      return { valid: false, error: "Department name must be less than 28 characters" };
    }
    if (data.teamName1.trim().length > 28) {
      return { valid: false, error: "Team name must be less than 28 characters" };
    }
    if (data.teamName2 && data.teamName2.trim().length > 28) {
      return { valid: false, error: "Team name must be less than 28 characters" };
    }
    if (data.teamName3 && data.teamName3.trim().length > 28) {
      return { valid: false, error: "Team name must be less than 28 characters" };
    }
    return { valid: true };
  }