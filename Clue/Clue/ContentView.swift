//
//  ContentView.swift
//  Clue
//
//  Created by Aakash Goradia on 1/10/26.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            if let url = URL(string: "https://kashmoney1192.github.io/clue/") {
                WebView(url: url)
                    .ignoresSafeArea()
            } else {
                VStack {
                    Image(systemName: "exclamationmark.triangle")
                        .imageScale(.large)
                        .foregroundStyle(.red)
                    Text("Failed to load game")
                        .padding()
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
