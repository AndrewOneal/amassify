import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify";

const scopes = [
    "user-top-read",
    "user-read-recently-played",
    "user-read-private"
].join(",")

const params = {
    scope: scopes,
}

const LOGIN_URL = "https://accounts.spotify.com/authorize" + new URLSearchParams(params).toString();

export const authOptions = {
    providers: [
            SpotifyProvider({
                clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
                authorization: LOGIN_URL
            })
        ]
}
