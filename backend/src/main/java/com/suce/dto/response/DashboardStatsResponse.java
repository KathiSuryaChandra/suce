package com.suce.dto.response;

import java.util.List;

public class DashboardStatsResponse {

    private double revenueLast30Days;
    private String revenueTrend;
    private long ordersLast30Days;
    private String ordersTrend;
    private long totalCustomers;
    private long lowStockCount;
    private long totalWishlistAdds;
    private long usersWithWishlistItems;
    private List<RecentOrderDto> recentOrders;
    private List<TopProductDto> topProducts;
    private List<TopWishlistedDto> topWishlisted;

    // ── Getters & Setters ────────────────────────────────────────────
    public double getRevenueLast30Days() { return revenueLast30Days; }
    public void setRevenueLast30Days(double v) { revenueLast30Days = v; }

    public String getRevenueTrend() { return revenueTrend; }
    public void setRevenueTrend(String v) { revenueTrend = v; }

    public long getOrdersLast30Days() { return ordersLast30Days; }
    public void setOrdersLast30Days(long v) { ordersLast30Days = v; }

    public String getOrdersTrend() { return ordersTrend; }
    public void setOrdersTrend(String v) { ordersTrend = v; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long v) { totalCustomers = v; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long v) { lowStockCount = v; }

    public long getTotalWishlistAdds() { return totalWishlistAdds; }
    public void setTotalWishlistAdds(long v) { totalWishlistAdds = v; }

    public long getUsersWithWishlistItems() { return usersWithWishlistItems; }
    public void setUsersWithWishlistItems(long v) { usersWithWishlistItems = v; }

    public List<TopWishlistedDto> getTopWishlisted() { return topWishlisted; }
    public void setTopWishlisted(List<TopWishlistedDto> v) { topWishlisted = v; }

    public List<RecentOrderDto> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<RecentOrderDto> v) { recentOrders = v; }

    public List<TopProductDto> getTopProducts() { return topProducts; }
    public void setTopProducts(List<TopProductDto> v) { topProducts = v; }

    // ── Nested ────────────────────────────────────────────────────────
    public static class RecentOrderDto {
        private Long id;
        private String orderNumber;
        private String customerName;
        private String status;
        private double totalAmount;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getOrderNumber() { return orderNumber; }
        public void setOrderNumber(String v) { orderNumber = v; }

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String v) { customerName = v; }

        public String getStatus() { return status; }
        public void setStatus(String v) { status = v; }

        public double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(double v) { totalAmount = v; }
    }

    public static class TopProductDto {
        private Long id;
        private String name;
        private long unitsSold;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String v) { name = v; }

        public long getUnitsSold() { return unitsSold; }
        public void setUnitsSold(long v) { unitsSold = v; }
    }

    public static class TopWishlistedDto {
        private String name;
        private long wishlistCount;

        public String getName() { return name; }
        public void setName(String v) { name = v; }

        public long getWishlistCount() { return wishlistCount; }
        public void setWishlistCount(long v) { wishlistCount = v; }
    }
}
