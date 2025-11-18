  // Status color mapping
  export const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "#245AB0"; 
      case "IN_PROGRESS":
        return "#EAB308"; 
      case "COMPLETED":
        return "#16A34A"; 
      case "CANCELED":
        return "#DC2626"; 
      default:
        return "#AAAAAA"; 
    }
  };