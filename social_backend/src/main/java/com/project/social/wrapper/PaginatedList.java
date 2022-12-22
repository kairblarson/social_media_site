package com.project.social.wrapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PaginatedList<T> {
    private static final int DEFAULT_PAGE_SIZE = 20; //this is where you alter page size

    private List<T> list;
    private List<List<T>> listOfPages;
    private int pageSize = DEFAULT_PAGE_SIZE;
    private int currentPage = 0;

    public PaginatedList(List<T> list) {
        this.list = list;
        initPages();
    }

    public PaginatedList(List<T> list, int pageSize) {
        this.list = list;
        this.pageSize = pageSize;
        initPages();
    }

    public List<T> getPage(int pageNumber) {
        if (listOfPages == null ||
                pageNumber > listOfPages.size() ||
                pageNumber < 1) {
            return Collections.emptyList();
        }

        currentPage = pageNumber;
        List<T> page = listOfPages.get(--pageNumber);
        return page;
    }

    public int numberOfPages() {
        if (listOfPages == null) {
            return 0;
        }

        return listOfPages.size();
    }

    public List<T> nextPage() {
        List<T> page = getPage(++currentPage);
        return page;
    }

    public List<T> previousPage() {
        List<T> page = getPage(--currentPage);
        return page;
    }

    public void initPages() {
        if (list == null || listOfPages != null) {
            return;
        }

        if (pageSize <= 0 || pageSize > list.size()) {
            pageSize = list.size();
        }

        int numOfPages = (int) Math.ceil((double) list.size() / (double) pageSize);
        listOfPages = new ArrayList<List<T>>(numOfPages);
        for (int pageNum = 0; pageNum < numOfPages; ) {
            int from = pageNum * pageSize;
            int to = Math.min(++pageNum * pageSize, list.size());
            listOfPages.add(list.subList(from, to));
        }
    }
}
