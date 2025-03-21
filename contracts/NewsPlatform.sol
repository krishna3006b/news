// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NewsPlatform {
    struct News {
        string ipfsHash;
        string title;
        uint256 timestamp;
        address author;
    }

    News[] public newsItems;
    uint256 public newsCount;

    event NewsUploaded(string ipfsHash, string title, uint256 timestamp, address author);

    function uploadNews(string memory _ipfsHash, string memory _title) public {
        newsItems.push(News(_ipfsHash, _title, block.timestamp, msg.sender));
        newsCount++;
        emit NewsUploaded(_ipfsHash, _title, block.timestamp, msg.sender);
    }

    function getNews(uint256 _index) public view returns (string memory, string memory, uint256, address) {
        News memory news = newsItems[_index];
        return (news.ipfsHash, news.title, news.timestamp, news.author);
    }
}