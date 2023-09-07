import { ObjectId } from 'mongodb';

const basicUtils = {
// checks if id is valid
  isValidId(id) {
    try {
      ObjectId(id);
    } catch (err) {
      return false;
    }
    return true;
  },
};

export default basicUtils;
