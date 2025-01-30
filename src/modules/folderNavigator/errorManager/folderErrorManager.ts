import { PostgrestError } from "@supabase/supabase-js";
import { FolderResponse } from "../types/folder"

const folderErrorManager = (error: PostgrestError):FolderResponse  => {

  switch(error.code){
    case '23505':
      return { error: true, message: 'A folder with the same name already exists in this location. Please choose a different name.' };
    case '22P02':
      return { error: true, message: 'The container folder name is invalid. Please check the folder name and try again.' };
    case '23503':
      return { error: true, message: 'The specified container does not exist. Please verify the container ID.' };
    case '22001':
      return { error: true, message: 'The data provided is too long for one or more fields. Please shorten the input and try again.' };
    case '23502':
      return { error: true, message: 'A required field is missing. Please fill in all required fields.' };
    case '23514':
      return { error: true, message: 'The data provided does not meet the required constraints. Please review your input.' };
    case '42501':
      return { error: true, message: 'You do not have sufficient permissions to perform this action. Contact your administrator.' };
    case '42601':
      return { error: true, message: 'There was a syntax error in the query. Please report this issue to the support team.' };
    case '42703':
      return { error: true, message: 'The specified column does not exist. Please check the field names and try again.' };
    case '42704':
      return { error: true, message: 'The specified table does not exist. Please verify the table name.' };
    case '57014':
      return { error: true, message: 'The operation was cancelled. Please try again.' };
    default:
      return { error: true, message: 'An unexpected error occurred. Please try again or contact support if the issue persists.' };
  }

}

export default folderErrorManager