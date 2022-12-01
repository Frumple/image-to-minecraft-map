export class MinecraftVersion {

  id: string;
  name: string | null;
  date: Date;

  constructor(id: string, name: string | null, date: Date) {
    this.id = id;
    this.name = name;
    this.date = date;
  }
}