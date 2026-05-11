import { APICategoryRepository } from "@/core/domain/repositories/api/api-category-repository";
import { FetchCategoryUseCase } from "@/core/domain/use-cases/category/fetch-category";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("Get serie by id e2e", () => {
  let mock: AxiosMockAdapter;

  beforeAll(() => {
    mock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  const successResponse = [
    { category_id: "1", category_name: "test", parent_id: "1" },
    { category_id: "2", category_name: "test2", parent_id: "2" },
  ];

  let repository: APICategoryRepository;
  let sut: FetchCategoryUseCase;

  it("should be able to fetch the series categories", async () => {
    mock.onGet("/player_api.php").reply(200, successResponse);

    repository = new APICategoryRepository("server", "username", "pass");
    sut = new FetchCategoryUseCase(repository);

    const { categories } = await sut.execute();

    expect(categories).toHaveLength(2);
    expect(categories[0].name).toEqual("test");
  });
});
