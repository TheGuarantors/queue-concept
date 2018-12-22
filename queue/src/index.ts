export function myTest(value: number): MyTest {
  return {
    name: `Clone-${value}`,
    age: value
  };
}

export interface MyTest {
  name: string;
  age: number;
}
