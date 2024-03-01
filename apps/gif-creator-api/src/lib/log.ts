import fs from "fs/promises";
import path from "path";

import type { ErrorFormat } from "../types/util";

const log = async (data: ErrorFormat): Promise<void> => {
    const filepath = path.join(__dirname, "..", "error.log");
    await fs.appendFile(filepath, JSON.stringify(data));
};

export default log;
