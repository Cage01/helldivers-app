import { queryAssignmentExternal } from "@/app/utilities/server_functions";
import path from "path";
import fs from 'fs';
import { Task } from "@/app/types/api/helldivers/assignment_types";

async function requestHandler(_request: Request): Promise<Response> {
  let res = await queryAssignmentExternal();

  if (res.length > 0) {
    //TODO: There could be an instance where there are multiple major orders to iterate through
    res = res[0];

    const planets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/json/planets.json"), 'utf-8'))

    for (let i = 0; i < res.setting.tasks.length; i++) {
      const index = res.setting.tasks[i].values[2]
      const updatedTasks: Task = {
        planetIndex: index,
        planetName: planets[index].name,
        ...res.setting.tasks[i],
      }

      res.setting.tasks[i] = updatedTasks
    }

    return Response.json(res);
  } else {
    return Response.json(undefined);
  }

}

export { requestHandler as GET };