import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as postsApi from "../api/posts";
import type { Post } from "../types";
import { PostCard } from "../components/PostCard";
import { TagChips } from "../components/TagChips";
import { Pagination } from "../components/Pagination";

export function PostsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const page = Number(searchParams.get("page")) || 1;
  const created = searchParams.get("created");

  const [queryInput, setQueryInput] = useState(q);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    setQueryInput(q);
  }, [q]);

  // Search/tag/page all live in the URL (via useSearchParams), not just
  // component state — so a filtered/paginated result is a real, shareable,
  // bookmarkable link, same as the old server-rendered ?q=&tag=&page= URLs.
  useEffect(() => {
    postsApi.getPosts({ q, tag, page }).then((data) => {
      setPosts(data.posts);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setAllTags(data.allTags);
    });
  }, [q, tag, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (queryInput) next.set("q", queryInput);
    if (tag) next.set("tag", tag);
    setSearchParams(next);
  }

  return (
    <div className="container" style={{ paddingTop: "3rem" }}>
      <div className="row justify-content-center text-center mb-5">
        <div className="col-lg-7">
          {created && (
            <div className="alert alert-success" role="alert">
              Post created successfully.
            </div>
          )}
          <h1 className="display-5 mb-3">All posts</h1>
          <p className="text-muted mb-4">{totalCount} published so far</p>

          <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title or content…"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {(q || tag) && (
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => {
                  setQueryInput("");
                  setSearchParams({});
                }}
              >
                Clear
              </button>
            )}
          </form>

          <TagChips tags={allTags} activeTag={tag} q={q} />
        </div>
      </div>

      <div className="row">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <div className="col-12 text-center py-5">
            <p className="text-muted">No posts found.</p>
          </div>
        )}
      </div>

      <Pagination totalPages={totalPages} currentPage={page} q={q} tag={tag} />
    </div>
  );
}
